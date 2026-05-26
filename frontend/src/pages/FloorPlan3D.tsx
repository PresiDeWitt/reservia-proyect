import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { restaurantsApi } from '../api/restaurants';
import type { TableData } from '../api/restaurants';

const FloorPlan3D: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const mountRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const selectedRef = useRef<string[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);

  useEffect(() => {
    if (!id) return;
    restaurantsApi.tables(id)
      .then((res) => setTables(res.tables))
      .catch(() => setTables([]))
      .finally(() => setLoadingTables(false));
  }, [id]);

  useEffect(() => {
    if (loadingTables || tables.length === 0) return;
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2018);
    scene.fog = new THREE.Fog(0x2a2018, 18, 50);

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 12, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.HemisphereLight(0xfff1d9, 0x3a2a1c, 0.3));
    scene.add(new THREE.AmbientLight(0xfff1d9, 1.0));
    const key = new THREE.DirectionalLight(0xfff1d9, 1.4);
    key.position.set(8, 14, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffeedd, 0.6);
    fill.position.set(-6, 8, -4);
    scene.add(fill);

    // Candle-like point lights
    [
      [-3, 1.2, -3],
      [3, 1.2, -3],
      [0, 1.2, 0],
      [-3, 1.2, 4],
      [3, 1.2, 4],
    ].forEach(([x, y, z]) => {
      const p = new THREE.PointLight(0xf97415, 1.8, 8, 2);
      p.position.set(x, y, z);
      scene.add(p);
    });

    // Floor
    const floorGeom = new THREE.PlaneGeometry(20, 18);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x4a3828, roughness: 0.95 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Bar
    const barGeom = new THREE.BoxGeometry(8, 1.1, 1);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x2a1c10, roughness: 0.35, metalness: 0.25 });
    const bar = new THREE.Mesh(barGeom, barMat);
    bar.position.set(0, 0.55, -7);
    bar.castShadow = true;
    bar.receiveShadow = true;
    scene.add(bar);

    // Private room walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a2c1c, roughness: 0.8 });
    [
      { pos: [4.5, 1.5, -2], size: [0.12, 3, 4] },
      { pos: [7.5, 1.5, -2], size: [0.12, 3, 4] },
      { pos: [6, 1.5, -4], size: [3, 3, 0.12] },
    ].forEach(({ pos, size }) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(...(size as [number, number, number])), wallMat);
      w.position.set(...(pos as [number, number, number]));
      w.castShadow = true;
      w.receiveShadow = true;
      scene.add(w);
    });

    // Plants for terrace
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x27562b, roughness: 0.8 });
    [-5, 5].forEach((x) => {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), plantMat);
      p.position.set(x, 0.5, 5.5);
      p.castShadow = true;
      scene.add(p);
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.3, 0.5, 16),
        new THREE.MeshStandardMaterial({ color: 0x6b3a1f, roughness: 0.7 }),
      );
      pot.position.set(x, 0.25, 5.5);
      pot.castShadow = true;
      scene.add(pot);
    });

    // Tables
    const tableMeshes: { mesh: THREE.Mesh; data: TableData }[] = [];
    tables.forEach((tableData) => {
      const tableId = String(tableData.id);
      const isSquare = tableData.capacity >= 4;
      const tableGeom = isSquare
        ? new THREE.BoxGeometry(1.6, 0.1, 1.2)
        : new THREE.CylinderGeometry(0.6, 0.6, 0.1, 24);
      const baseColor = tableData.available ? 0x6b3a1f : 0x444444;
      const tableMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.6 });
      const mesh = new THREE.Mesh(tableGeom, tableMat);
      mesh.position.set(tableData.posX, 0.85, tableData.posY);
      mesh.rotation.y = tableData.rotation;
      mesh.castShadow = true;
      mesh.userData = { id: tableId, available: tableData.available };
      scene.add(mesh);

      // Leg
      const legGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.85, 12);
      const leg = new THREE.Mesh(legGeom, tableMat);
      leg.position.set(tableData.posX, 0.4, tableData.posY);
      scene.add(leg);

      // Chairs
      const chairCount = Math.min(tableData.capacity, 8);
      for (let i = 0; i < chairCount; i++) {
        const angle = (i / chairCount) * Math.PI * 2;
        const r = isSquare ? 1.0 : 0.95;
        const cx = tableData.posX + Math.cos(angle) * r;
        const cz = tableData.posY + Math.sin(angle) * r;
        const chair = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.5, 0.4),
          new THREE.MeshStandardMaterial({ color: 0x2a1c10, roughness: 0.7 }),
        );
        chair.position.set(cx, 0.25, cz);
        chair.castShadow = true;
        scene.add(chair);
      }

      tableMeshes.push({ mesh, data: tableData });
    });

    // Orbit controls (manual)
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let theta = 0;
    let phi = Math.PI / 4;
    let radius = 16;
    const updateCamera = () => {
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      theta -= dx * 0.005;
      phi = Math.max(0.2, Math.min(Math.PI / 2.1, phi - dy * 0.005));
      prevX = e.clientX;
      prevY = e.clientY;
      updateCamera();
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(8, Math.min(28, radius + e.deltaY * 0.01));
      updateCamera();
    };

    // Raycaster for clicks
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const meshes = tableMeshes.map((t) => t.mesh);
      const hits = raycaster.intersectObjects(meshes);
      if (hits.length > 0) {
        const tableId = hits[0].object.userData.id as string;
        const avail = hits[0].object.userData.available as boolean;
        if (avail) {
          const next = selectedRef.current.includes(tableId)
            ? selectedRef.current.filter((x) => x !== tableId)
            : [...selectedRef.current, tableId];
          selectedRef.current = next;
          setSelected(next);
        }
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('click', onClick);

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation loop — update selection highlight
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = performance.now() * 0.002;
      tableMeshes.forEach(({ mesh, data }) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const tableId = String(data.id);
        if (selectedRef.current.includes(tableId)) {
          mat.emissive = new THREE.Color(0xf97415);
          mat.emissiveIntensity = 0.5 + Math.sin(t * 3) * 0.2;
        } else if (data.available) {
          mat.emissive = new THREE.Color(0x000000);
          mat.emissiveIntensity = 0;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, [tables, loadingTables]);

  const selectedTables = tables.filter((t) => selected.includes(String(t.id)));
  const totalSupplement = selectedTables.reduce((sum, t) => sum + t.supplement, 0);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--espresso)', marginTop: -88, paddingTop: 88 }}>
      {loadingTables && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 30,
          display: 'grid', placeItems: 'center', background: 'var(--espresso)',
        }}>
          <div style={{ color: 'var(--cream)', textAlign: 'center' }}>
            <div className="spin" style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--primary)', display: 'inline-block' }} />
            <div style={{ marginTop: 16, fontSize: 14 }}>{t('floorPlan.loading')}</div>
          </div>
        </div>
      )}
      <div ref={mountRef} style={{ width: '100%', height: 'calc(100vh - 88px)', cursor: 'grab' }} />

      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 24,
          right: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          color: 'var(--cream)',
        }}
      >
        <Link
          to={`/restaurant/${id}`}
          className="btn btn-dark"
        >
          <span className="mat" style={{ fontSize: 16 }}>arrow_back</span>
          <span>{t('floorPlan.back')}</span>
        </Link>
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'rgba(248,247,245,0.6)' }}>{t('floorPlan.eyebrow')}</div>
          <div className="editorial" style={{ fontSize: 22, fontWeight: 400 }}>
            {t('floorPlan.title')} <span className="italic-accent">{t('floorPlan.titleAccent')}</span>
          </div>
        </div>
        <div style={{ width: 100 }} />
      </div>

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          right: 24,
          padding: 14,
          background: 'rgba(15,23,42,0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'var(--r-md)',
          color: 'var(--cream)',
          zIndex: 5,
          fontSize: 11,
        }}
        className="hide-sm"
      >
        <div className="eyebrow" style={{ color: 'rgba(248,247,245,0.6)' }}>{t('floorPlan.legend')}</div>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#6b3a1f', borderRadius: 2, marginRight: 6 }} /> {t('floorPlan.available')}</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#f97415', borderRadius: 2, marginRight: 6 }} /> {t('floorPlan.selected')}</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#444', borderRadius: 2, marginRight: 6 }} /> {t('floorPlan.taken')}</span>
        </div>
      </div>

      {/* Bottom selection bar */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'var(--surface)',
              padding: 20,
              borderTop: '1px solid var(--border)',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.4)',
              zIndex: 20,
            }}
          >
            <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div className="eyebrow">{t('floorPlan.selectedTables')}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  {selectedTables.map((t) => (
                    <span
                      key={t.id}
                      className="chip active"
                      style={{ background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }}
                    >
                      {t.label} · {t.capacity}p · {t.zone}
                    </span>
                  ))}
                </div>
              </div>
              {totalSupplement > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div className="eyebrow">{t('floorPlan.supplement')}</div>
                  <div className="mono-num" style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>
                    +€{totalSupplement}
                  </div>
                </div>
              )}
              <button
                onClick={() => navigate(`/restaurant/${id}`)}
                className="btn btn-primary"
                style={{ height: 52, padding: '0 28px' }}
              >
                <span>{t('floorPlan.confirmSelection')}</span>
                <span className="mat" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloorPlan3D;
